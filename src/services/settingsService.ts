export const getPublicSettings = async () => {
  const res = await fetch('/api/settings');
  return res.json();
};

export const getAdminSettings = async (token: string) => {
  const res = await fetch('/api/admin/settings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateSetting = async (token: string, key: string, value: any) => {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ key, value })
  });
  return res.json();
};

export const bulkUpdateSettings = async (token: string, settings: any) => {
  const res = await fetch('/api/admin/settings/bulk', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ settings })
  });
  return res.json();
};
