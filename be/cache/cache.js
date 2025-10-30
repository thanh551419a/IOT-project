// cache.js
class Cache {
  constructor() {
    this.data = {
      temperature: null,
      humidity: null,
      light: null,
      led1: null,
      led2: null,
      led3: null,
      dayCollectionCreate: null,
    };
  }

  set(key, value) {
    this.data[key] = value;
  }

  get(key) {
    return this.data[key];
  }
  reset(){
    this.data = {
      ...this.data, // giữ nguyên các key hiện có     
      temperature: 0,
      humidity: 0,
      light: 0,
      led1: "OFF",
      led2: "OFF",
      led3: "OFF",
    };
  }
}

const instance = new Cache();
export default instance;
