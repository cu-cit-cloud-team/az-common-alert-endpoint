exports.isExpressRouteAlert = (targetIds) =>
  targetIds.filter((targetId) =>
    targetId.toLowerCase().includes('expressroutecircuits'),
  );
