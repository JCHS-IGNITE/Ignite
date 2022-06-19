module.exports = async (time) =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, 1000 * time);
  });
