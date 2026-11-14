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
  }
};
