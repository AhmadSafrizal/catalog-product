(async () => {
  try {
    const base = 'http://localhost:3000';
    const email = `test+${Date.now()}@example.com`;

    const regRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Admin', email, password: 'P@ssw0rd!' }),
    });
    const regText = await regRes.text();
    console.log('REGISTER_RESP', regText);

    let token = '';
    try {
      const j = JSON.parse(regText);
      token = j.token || j.accessToken || j.data?.token || j.data?.accessToken || j.data?.access_token || '';
    } catch (e) {
      console.error('PARSE_ERR register', e);
    }
    console.log('TOKEN', token);

    const createRes = await fetch(`${base}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Temp Test Blog', slug: `temp-${Date.now()}`, content: 'temp' }),
    });
    const createText = await createRes.text();
    console.log('CREATED', createText);

    let id = '';
    try {
      const cj = JSON.parse(createText);
      id = cj.data?.id || cj.id || '';
    } catch (e) {
      console.error('PARSE_ERR create', e);
    }
    console.log('BLOG_ID', id);

    if (id) {
      const delRes = await fetch(`${base}/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const delText = await delRes.text();
      console.log('DELETE_RESP', delText);
    } else {
      console.log('No BLOG_ID; skipping delete');
    }
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
