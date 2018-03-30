import axios from 'axios';

module.exports = {
  setToken        : (token) =>{
    console.log('Setting Token');
    console.log(token);
    localStorage.setItem('token', token);
  },
  getToken        : () =>{
    let storagedToken = localStorage.getItem('token');
    return storagedToken;
  },
  setUserData     : (user) =>{
    console.log('Setting UserData');
    const stringUser =JSON.stringify(user);
    console.log(stringUser);
    localStorage.setItem('userData', stringUser);
  },
  getUserData     : () =>{
    console.log('Get UserData');
    let storagedUserData = JSON.parse(localStorage.getItem('userData'));
      // console.log(storagedUserData);
    return storagedUserData;
  },
  logout          : () => {
    console.log('Delete LocalStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  },
  fetchToken: (code) => {
    const url = `http://localhost:9999/authenticate/${code}`;
    console.log('Fetching...',url);
    axios.get(url)
    .then((response) =>{
      console.log(response);
      return response
    })
    .catch(error => console.error(error))
  }
}
