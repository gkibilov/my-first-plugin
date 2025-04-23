import { ConfiguratorRuleInput } from './models.js';

function extractProductIds(rule: ConfiguratorRuleInput): Set<string> {
  const ids = new Set<string>();

  for (const criterion of rule.criteria) {
    if (criterion.rootObjectId?.startsWith('01t')) {
      ids.add(criterion.rootObjectId);
    }
    criterion.sourceValues?.forEach((v) => {
      if (v.startsWith('01t')) ids.add(v);
    });
    criterion.sourceInformation?.forEach((info) => {
      if (info.name === 'Product') {
        info.values?.values.forEach((v) => {
          if (v?.startsWith('01t')) ids.add(v);
        });
      }
    });
  }

  for (const action of rule.actions) {
    action.targetValues?.forEach((v) => {
      if (v.startsWith('01t')) ids.add(v);
    });
    action.targetInformation?.forEach((info) => {
      if (info.name === 'Product') {
        info.values?.values.forEach((v) => {
          if (v?.startsWith('01t')) ids.add(v);
        });
      }
    });
  }

  return ids;
}

export function groupByNonIntersectingProduct2(rules: ConfiguratorRuleInput[]): Map<string, ConfiguratorRuleInput[]> {
  const ruleToProducts = new Map<ConfiguratorRuleInput, Set<string>>();
  const productToRules = new Map<string, Set<ConfiguratorRuleInput>>();

  for (const rule of rules) {
    const ids = extractProductIds(rule);
    ruleToProducts.set(rule, ids);
    for (const id of ids) {
      if (!productToRules.has(id)) {
        productToRules.set(id, new Set());
      }
      productToRules.get(id)!.add(rule);
    }
  }

  const parent = new Map<ConfiguratorRuleInput, ConfiguratorRuleInput>();

  const find = (x: ConfiguratorRuleInput): ConfiguratorRuleInput => {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  };

  const union = (x: ConfiguratorRuleInput, y: ConfiguratorRuleInput): void => {
    const rootX = find(x);
    const rootY = find(y);
    if (rootX !== rootY) {
      parent.set(rootY, rootX);
    }
  };

  for (const rule of rules) {
    parent.set(rule, rule);
  }

  for (const linkedRules of productToRules.values()) {
    const [first, ...rest] = [...linkedRules];
    for (const rule of rest) {
      union(first, rule);
    }
  }

  const rootToGroup = new Map<ConfiguratorRuleInput, ConfiguratorRuleInput[]>();
  for (const rule of rules) {
    const root = find(rule);
    if (!rootToGroup.has(root)) {
      rootToGroup.set(root, []);
    }
    rootToGroup.get(root)!.push(rule);
  }

  const result = new Map<string, ConfiguratorRuleInput[]>();
  let groupCounter = 1;

  for (const group of rootToGroup.values()) {
    const ids = [...(ruleToProducts.get(group[0]) ?? [])];
    const key = ids[0] || `group_${groupCounter++}`;
    result.set(key, group);
  }

  return result;
}
