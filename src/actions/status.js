/**
  * Show Error
  */

const statusReplace = async (dispatch, type, message) => dispatch({ type: 'STATUS_REPLACE', [type]: message });

export default async (dispatch, type, val) => {
  // Validate types
  const allowed = ['error', 'success', 'info', 'loading'];
  if (!allowed.includes(type)) {
    return Promise.reject('Type should be one of success, error or info');
  }

  // Set some defaults for convenience
  let message = val;
  if (!val) {
    if (type === 'success') message = 'Success';
    if (type === 'error') message = 'Sorry, an error occurred';
    if (type === 'info') message = 'Something is happening...';
    if (type === 'loading' && val !== false) message = true;
  }

  return statusReplace(dispatch, type, message);
};
