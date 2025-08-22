module.exports = function transform(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const aliasMap = [
    // core → new structure (relative)
    { from: /^(?:\.{1,2}\/)*core\/repositories\//, to: '@repos/' },
    { from: /^(?:\.{1,2}\/)*core\/services\//,     to: '@domain/services/' },
    { from: /^(?:\.{1,2}\/)*core\/models\//,       to: '@domain/types/' },
    { from: /^(?:\.{1,2}\/)*core\/utils\//,        to: '@lib/utils/' },
    { from: /^(?:\.{1,2}\/)*core\/config\//,       to: '@lib/config/' },
    { from: /^(?:\.{1,2}\/)*core\/constants\//,    to: '@lib/config/constants' },
    { from: /^(?:\.{1,2}\/)*core\/hooks\//,        to: '@components/hooks/' },
    // core → new structure (alias '@/core/...')
    { from: /^@\/core\/repositories\//, to: '@repos/' },
    { from: /^@\/core\/services\//,     to: '@domain/services/' },
    { from: /^@\/core\/models\//,       to: '@domain/types/' },
    { from: /^@\/core\/utils\//,        to: '@lib/utils/' },
    { from: /^@\/core\/config\//,       to: '@lib/config/' },
    { from: /^@\/core\/constants\//,    to: '@lib/config/constants' },
    { from: /^@\/core\/hooks\//,        to: '@components/hooks/' },
    // fallback: any other core import → domain root
    { from: /^(?:\.{1,2}\/)*core\//,               to: '@domain/' },
    { from: /^@\/core\//,                           to: '@domain/' },

    // components paths → @components
    { from: /^(?:\.{1,2}\/)+components\//, to: '@components/' },
    { from: /^@components\//, to: '@components/' },
    { from: /^@\/components\//, to: '@components/' },
    // legacy inner paths
    { from: /^@components\/draft\//, to: '@components/draft/' },
    { from: /^@components\/schedule\//, to: '@components/features/leagues/' },
    { from: /^@components\/league\//, to: '@components/features/leagues/' },
    { from: /^@components\/layouts\//, to: '@components/layout/' },
    { from: /^@components\/docs\//, to: '@components/docs/' },
    { from: /^@components\/features\/draft\//, to: '@components/features/draft/' },
    { from: /^@components\/features\/leagues\//, to: '@components/features/leagues/' },

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