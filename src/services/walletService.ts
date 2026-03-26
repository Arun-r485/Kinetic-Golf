
export const getWallet = async (token: string) => {
    const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const requestWithdrawal = async (
    token: string,
    payload: {
        amount: number;
        withdrawalMethod: 'bank' | 'upi';
        bankAccountName?: string;
        bankAccountNumber?: string;
        bankIfsc?: string;
        bankName?: string;
        upiId?: string;
    }
) => {
    const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    return res.json();
};

export const getWithdrawalHistory = async (token: string) => {
    const res = await fetch('/api/wallet/history', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const getAdminWithdrawals = async (token: string) => {
    const res = await fetch('/api/admin/withdrawals', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const approveWithdrawal = async (token: string, id: string) => {
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const rejectWithdrawal = async (token: string, id: string, note: string) => {
    const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminNote: note })
    });
    return res.json();
};

export const markPaidWithdrawal = async (token: string, id: string) => {
    const res = await fetch(`/api/admin/withdrawals/${id}/mark-paid`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};
