-- Consume only after the decision row exists.
-- Keeps one analysis per decision (unique index from 0002).

create or replace function public.try_consume_decision(p_decision_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  entitlement jsonb;
  already boolean;
  owned boolean;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.subscriptions (user_id, plan, status)
  values (uid, 'free', 'none')
  on conflict (user_id) do nothing;

  perform 1 from public.subscriptions where user_id = uid for update;

  select exists (
    select 1
    from public.decisions
    where id = p_decision_id
      and user_id = uid
  ) into owned;

  if not owned then
    raise exception 'Decision not found';
  end if;

  select exists (
    select 1
    from public.usage_events
    where user_id = uid
      and decision_id = p_decision_id
      and kind = 'decision_analysis'
  ) into already;

  if already then
    entitlement := public.get_entitlement();
    return jsonb_build_object(
      'allowed', true,
      'remaining', entitlement -> 'remaining',
      'plan', entitlement ->> 'plan',
      'duplicate', true
    );
  end if;

  entitlement := public.get_entitlement();
  if not (entitlement ->> 'can_analyze')::boolean then
    return jsonb_build_object(
      'allowed', false,
      'remaining', entitlement -> 'remaining',
      'plan', entitlement ->> 'plan',
      'message', 'You''ve used your free decisions. Keep deciding with Pro or Premium.'
    );
  end if;

  insert into public.usage_events (user_id, kind, decision_id)
  values (uid, 'decision_analysis', p_decision_id);

  entitlement := public.get_entitlement();
  return jsonb_build_object(
    'allowed', true,
    'remaining', entitlement -> 'remaining',
    'plan', entitlement ->> 'plan'
  );
end;
$$;

grant execute on function public.try_consume_decision(uuid) to authenticated;
