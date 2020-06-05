// import { auth_config } from '../config';
// const { endpoint, apiKey } = auth_config;
// import { maybeSetToken } from './apiCalls/api';

export default class Auth {

  async requestCode({ email }) {
    this.inProgress = true;
    const method = "GET";

    // headers
    const head = new Headers();
    head.append('Content-Type', 'application/json');
    // init
    const init = {
      method,
      headers: head,
      // mode: 'cors',
      cache: 'default'
    };
    const req = new Request(`${endpoint}/code?email=${email}`);
    const res = await fetch(req, init);
    const json = await res.json();
    return json;
    // this.lock.show();
    // this.auth0.authorize();
  }

  async validateCode({ email, code}) {
    this.inProgress = true;
    const method = "POST";

    // headers
    const head = new Headers();
    head.append('Content-Type', 'application/json');
    // init
    const init = {
      method,
      headers: head,
      // mode: 'cors',
      cache: 'default'
    };
    init.body = JSON.stringify({ email, code });
    const req = new Request(`${endpoint}/auth`);
    const res = await fetch(req, init);
    const json = await res.json();
    if (json.success && json.token) this.setSession(json)
    return json;
    // this.lock.show();
    // this.auth0.authorize();
  }

  getSession() {
    const token = localStorage.getItem('@NOCO-token');
    return { token };
  }

  setSession(authResult, navigate = false) {
    const { user, token, expiresAt } = authResult;
    maybeSetToken(token);
    localStorage.setItem('@NOCO-token', authResult.token);
    localStorage.setItem('@NOCO-user', JSON.stringify(authResult.user));
    localStorage.setItem('@NOCO-expires_at', expiresAt);
    this.scheduleRenewal();
  }

  logout(history) {
    // Clear Access Token and ID Token from local storage
    maybeSetToken("", true);
    localStorage.removeItem('@NOCO-token');
    localStorage.removeItem('@NOCO-expires_at');
    localStorage.removeItem('@NOCO-user');
    // navigate to the home route
    history.push({
      pathname: '/',
    })
    // window.location = `https://${auth0Config.domain}/v2/logout?returnTo=${auth0Config.redirectUrl.replace('/callback', '')}&client_id=${auth0Config.clientId}`
  }

  renewToken() {
    // pass a valid token in, and get a refreshed one back.
  }

  scheduleRenewal() {
    if (this.renewalInProgress) return;
    this.renewalInProgress = true;
    setTimeout(() => {
      this.renewalInProgress = false;
    }, 10000)
    const expiresAt = JSON.parse(localStorage.getItem('@NOCO-expires_at'));
    const delay = expiresAt - Date.now();
    if (delay > 0) {
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewToken();
      }, delay);
    }
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('@NOCO-expires_at'));
    const token = localStorage.getItem('@NOCO-token');
    maybeSetToken(token);
    return new Date().getTime() < expiresAt && token;
  }
}
