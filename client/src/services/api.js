const API_BASE = '/api';

export const api = {
  async getTerrenos() {
    const res = await fetch(`${API_BASE}/terrenos`);
    if (!res.ok) throw new Error('Error al cargar la lista de terrenos');
    return res.json();
  },

  async getTerrenoById(id) {
    const res = await fetch(`${API_BASE}/terrenos/${id}`);
    if (!res.ok) throw new Error(`Error al cargar terreno #${id}`);
    return res.json();
  },

  async createTerreno(terrenoData) {
    const res = await fetch(`${API_BASE}/terrenos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(terrenoData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al guardar el nuevo terreno');
    }
    return res.json();
  },

  async updateTerreno(id, terrenoData) {
    const res = await fetch(`${API_BASE}/terrenos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(terrenoData)
    });
    if (!res.ok) throw new Error(`Error al actualizar terreno #${id}`);
    return res.json();
  },

  async deleteTerreno(id) {
    const res = await fetch(`${API_BASE}/terrenos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Error al eliminar terreno #${id}`);
    return res.json();
  },

  async getTerrenoNasaData(id) {
    const res = await fetch(`${API_BASE}/terrenos/${id}/nasa-data`);
    if (!res.ok) throw new Error('Error al obtener datos satelitales de la NASA');
    return res.json();
  },

  async getTerrenoRecomendaciones(id) {
    const res = await fetch(`${API_BASE}/terrenos/${id}/recomendaciones`);
    if (!res.ok) throw new Error('Error al generar recomendaciones agronómicas');
    return res.json();
  },

  async getClimaPuntual(lat, lon, suelo = 'Franco') {
    const res = await fetch(`${API_BASE}/nasa/clima-punto?lat=${lat}&lon=${lon}&suelo=${encodeURIComponent(suelo)}`);
    if (!res.ok) throw new Error('Error al consultar clima puntual');
    return res.json();
  },

  async getSeguimientos() {
    const res = await fetch(`${API_BASE}/seguimientos`);
    if (!res.ok) throw new Error('Error al cargar la lista de seguimientos');
    return res.json();
  },

  async createSeguimiento(segData) {
    const res = await fetch(`${API_BASE}/seguimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(segData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al guardar el seguimiento');
    }
    return res.json();
  },

  async registerRiego(id, date, tone = 'ok', label = 'Seguiste la recomendación') {
    const res = await fetch(`${API_BASE}/seguimientos/${id}/riego`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, tone, label })
    });
    if (!res.ok) throw new Error(`Error al registrar riego en seguimiento #${id}`);
    return res.json();
  },

  async deleteSeguimiento(id) {
    const res = await fetch(`${API_BASE}/seguimientos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Error al eliminar seguimiento #${id}`);
    return res.json();
  },

  // Autenticación de usuarios
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    return data;
  },

  async register(nombre, email, password, finca_nombre) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, finca_nombre })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar la cuenta');
    }
    return data;
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Sesión inválida o expirada');
    return res.json();
  },

  async logout(token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      // Ignorar error al cerrar sesión
    }
  }
};
