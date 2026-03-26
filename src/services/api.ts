const API_BASE_URL = "/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  register: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(e.message || text);
      }
    }
    return res.json();
  },
  login: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    const result = await res.json();
    localStorage.setItem("token", result.token);
    return result;
  },
  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Payment
  createOrder: async (amount: number, plan: string) => {
    const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, plan }),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  verifyPayment: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/payment/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Scores
  addScore: async (data: { date: string; course: string; score: number; holes?: number; holeScores?: number[]; holePars?: number[] }) => {
    const res = await fetch(`${API_BASE_URL}/scores/add`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  updateScore: async (id: string, data: { date: string; course: string; score: number; holes?: number; holeScores?: number[]; holePars?: number[] }) => {
    const res = await fetch(`${API_BASE_URL}/scores/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  deleteScore: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/scores/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getScores: async () => {
    const res = await fetch(`${API_BASE_URL}/scores`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Draws
  getCurrentDraw: async () => {
    const res = await fetch(`${API_BASE_URL}/draws/current`);
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getDrawHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/draws/history`);
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Charities
  getCharities: async () => {
    const res = await fetch(`${API_BASE_URL}/charities`);
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  selectCharity: async (data: { charityId: string }) => {
    const res = await fetch(`${API_BASE_URL}/charities/select`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Winners
  uploadProof: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/winners/upload-proof`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getWinnerStatus: async () => {
    const res = await fetch(`${API_BASE_URL}/winners/status`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getWalletBalance: async () => {
    const res = await fetch(`${API_BASE_URL}/wallet/balance`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Subscription & Billing
  getBillingHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/subscription/billing-history`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  cancelSubscription: async () => {
    const res = await fetch(`${API_BASE_URL}/subscription/cancel`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  updatePaymentMethod: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/subscription/update-payment`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getWinners: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/winners`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  getAdminChartData: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/chart-data`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  sendDrawReminders: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/draw/remind`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  runDraw: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/draw/run`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  simulateDraw: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/draw/simulate`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  publishDraw: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/draw/publish/${id}`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  updateWinnerStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/winners/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE_URL}/settings`);
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  updateSettings: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },

  // Admin Charity Management
  addCharity: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/charities`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  updateCharity: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/charities/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || text);
      } catch (e: any) {
        throw new Error(text);
      }
    }
    return res.json();
  },
  deleteCharity: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/charities/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
