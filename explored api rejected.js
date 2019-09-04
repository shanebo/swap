app.on('has:beforeRoute', '.btn', handle);
app.on('has:onRoute', '.btn', handle);
app.on('has:offRoute', '.btn', handle);
app.on('route', '/foo', handle);
app.on('click', '.btn', handle);
app.on('atelunch', handle);
