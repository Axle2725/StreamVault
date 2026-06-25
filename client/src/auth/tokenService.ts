class TokenService {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}

export const tokenService = new TokenService();
