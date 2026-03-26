-- Run this in Supabase SQL Editor before starting server

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE NOT NULL,
  balance numeric(10,2) DEFAULT 0.00,
  total_earned numeric(10,2) DEFAULT 0.00,
  total_withdrawn numeric(10,2) DEFAULT 0.00,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  -- 'pending' | 'approved' | 'rejected' | 'paid'
  bank_account_name text,
  bank_account_number text,
  bank_ifsc text,
  bank_name text,
  upi_id text,
  withdrawal_method text NOT NULL,
  -- 'bank' | 'upi'
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
