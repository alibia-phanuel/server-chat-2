const humanSleep = async () => {
    const delay = Math.floor(Math.random() * 2500) + 1500;
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  export default humanSleep;