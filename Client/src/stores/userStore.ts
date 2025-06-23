import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const teamname = ref('从容应队');
  const username = ref('NaN');
  const title = ref('CodeOnline');
  const account = ref('18812345678');
  const isLoggedIn = ref(false);

  const setTitle = (newTitle: string) => {
    title.value = newTitle;
  };

  const setUsername = (newUsername: string) => {
    username.value = newUsername;
  };

  const setAccount = (newAccount: string) => {
    account.value = newAccount;
    isLoggedIn.value = true;
  };

  const logout = () => {
    isLoggedIn.value = false;
  };

  return {
    teamname,
    username,
    title,
    account,
    isLoggedIn,
    setTitle,
    setUsername,
    setAccount,
    logout,
  };
});
