import axios from 'axios'

const BASE = 'http://localhost:3000'

export async function getUserById(id) {
  try {
    const res = await axios.get(`${BASE}/users/${id}`)
    return res.data
  } catch (err) {
    const server = err?.response?.data || err?.response
    const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
    const e = new Error(msg)
    e.cause = err
    throw e
  }
}

export default { getUserById }
