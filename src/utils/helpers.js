/**
 * Function to convert Firebase snapshot object of objets to array of objects
 */
export const snapshotToArray = snapshot => {
  const array = [];
  snapshot.forEach(childSnapshot => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    array.push(item);
  });
  return array;
};

/**
 * Function to convert array to Firebase snapshot object
 */
export const arrayToSnapshot = array => {
  const snapshot = {};
  for (let i = 0; i < array.length; i++) {
    const { key, ...rest } = array[i];
    Object.assign(snapshot, { [key]: rest });
  }
  return snapshot;
};

/**
  * Similar to snapshotToArray() function, but instead used in
    a nested (regular JS) object from an already acquired Firebase snapshot
  */
export const objectToArray = obj => {
  const array = [];
  for (item in obj) {
    const arrayItem = obj[item];
    arrayItem.key = item;
    array.push(arrayItem);
  }
  return array;
};
