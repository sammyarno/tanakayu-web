-- transactions.amount was `real` (float4), which holds only ~7 significant
-- digits. Individual amounts survived, but summing them accumulated error:
-- the balance for everything before 2026-02-01 came out as 16,610,000 when the
-- exact total is 16,610,017. Rp 17 quietly vanished from a financial report,
-- and the drift grows with the running balance.
--
-- Verified before running: all 871 rows are whole integers, max 66,600,000, and
-- every value (including the one above float4's 16,777,216 exact-integer limit)
-- is stored exactly - so this conversion is lossless for existing data.

alter table public.transactions
  alter column amount type numeric(14, 2) using amount::numeric;
