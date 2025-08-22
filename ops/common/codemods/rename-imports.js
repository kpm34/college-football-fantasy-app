module.exports = function transform(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const aliasMap = [
    // components moved under app/components
    { from: /^(\.\.?\/)+components\//, to: '@/components/' },
    { from: /^@components\//, to: '@\/components/' },
    { from: /^\/@components\//, to: '@\/components/' },
    // hooks/types absolute fallbacks to new aliases
    { from: /^\/(hooks|types)\//, to: '@/$1/' },
  ];

  function rewrite(value) {
    let next = value;
    for (const rule of aliasMap) {
      if (rule.from.test(next)) {
        next = next.replace(rule.from, rule.to);
      }
    }
    return next;
  }

  root
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const v = path.node.source.value;
      if (typeof v !== 'string') return;
      const updated = rewrite(v);
      if (updated !== v) {
        path.node.source.value = updated;
      }
    });

  return root.toSource({ quote: 'single' });
};