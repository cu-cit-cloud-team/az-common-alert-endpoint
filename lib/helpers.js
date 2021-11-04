/**
 * isExpressRouteAlert
 * @summary returns true if the alertId indicates it's for the expressroute
 * @param  {Array} targetIds
 * @returns {boolean}
 */
exports.isExpressRouteAlert = (targetIds) => {
  const result = targetIds.filter((targetId) =>
    targetId.toLowerCase().includes('expressroutecircuits'),
  );
  return Boolean(result.length);
};

/**
 * whichPeer
 * @summary returns the peer that fired the alert
 * @param  {Array} dimensions
 * @returns {string} (e.g. "Primary-IPv4" or "Secondary-IPv4")
 */
exports.whichPeer = (dimensions) => {
  const result = dimensions.filter(
    (dimension) => dimension.name.toLowerCase() === 'peer',
  );
  return result[0].value;
};

/**
 * isPrimary
 * @summary returns true if primary expressroute peer
 * @param  {string} peer (ex: "Primary-IPv4")
 * @returns {boolean}
 */
exports.isPrimary = (peer) => peer.toLowerCase().includes('primary');
