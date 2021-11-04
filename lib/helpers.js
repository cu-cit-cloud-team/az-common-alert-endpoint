const store = require('store2');

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

/**
 * initPeersStatus
 * @summary looks for datastore user for peers and creates if not there
 * @returns {void}
 */
exports.initPeersStatus = () => {
  if (!store('peersStatus')) {
    store('peersStatus', {
      // true/false === up/down
      'Primary-IPv4': true,
      'Secondary-IPv4': true,
    });
  }
};

/**
 * getPeersStatus
 * @summary returns peersSatus object from datastore
 * @returns {string}
 */
exports.getPeersStatus = () => store('peersStatus');

/**
 * getPeerStatus
 * @summary returns status of an individual peer in the peersStatus datastore
 * @param  {string} [peer='Primary-IPv4']
 * @returns {string}
 */
exports.getPeerStatus = (peer = 'Primary-IPv4') => store('peersStatus')[peer];

/**
 * isPeerUp
 * @summary returns status of a particular peer from datastore
 * @param  {string} [peer='Primary-IPv4']
 * @returns {boolean}
 */
exports.isPeerUp = (peer = 'Primary-IPv4') => {
  return exports.getPeersStatus[peer];
};

/**
 * setPeersStatus
 * @summary sets the full peersStatus datastore object
 * @param  {Object} updatedPeersData
 * @returns {void}
 */
exports.setPeersStatus = (updatedPeersData) => {
  store('peersStatus', updatedPeersData);
};

/**
 * setPeerStatus
 * @summary updates status of an individual peer in the peersStatus datastore
 * @param  {string} peer
 * @param  {boolean} status
 * @returns {Object} full peersStatus datastore object
 */
exports.setPeerStatus = (peer, status) => {
  const peersStatus = exports.getPeersStatus();
  peersStatus[peer] = status;
  exports.setPeersStatus(peersStatus);
  const updatedPeersStatus = exports.getPeersStatus();
  return updatedPeersStatus;
};
