const removeAfterUnderscore = (str) => {
  try {
    return str?.split("_")[0];
  } catch {
    console.error(str);
  }
};

export default removeAfterUnderscore;
