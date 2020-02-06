const buildRoute = (when, method, pattern, handle) => {
  const regex = patternRegex(pattern);
  const params = getParams(pattern, regex);
  method = method.toLowerCase();
  return { when, method, pattern, regex, params, handle };
}


const findRoute = (req, route) => {
  req.params = {}; // this needs to get returned somehow !!!!!!!!!!!!!!!!!!!

  if (route.when !== req.when) return false;
  if (route.method !== req.method) return false;
  if (route.pattern === req.to.pathname) return true;

  const matches = req.to.pathname.match(route.regex);

  if (matches) {
    matches.shift();
    let i = 0;
    for (; i < route.params.length; i++) {
      req.params[route.params[i]] = matches[i];
    }
    return true;
  }

  return false;
}


const patternRegex = (pattern) =>
  new RegExp(`^${pattern.replace(/:[^\/\(\):.-]+/g, '([^/]+)')}$`);


const getParams = (pattern, regex) => {
  const regexChars = /\?|\(|\)/g;
  const matches = pattern.replace(regexChars, '').match(regex);
  if (matches) {
    matches.shift();
    return matches.map(item => item.replace(':', ''));
  }
  return [];
}


export {
  findRoute,
  buildRoute
};
