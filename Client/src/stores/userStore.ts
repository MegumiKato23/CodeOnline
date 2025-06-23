import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const teamname = ref('从容应队');
  const username = ref('NaN');
  const title = ref('CodeOnline');
  const account = ref('18812345678');
  const isLoggedIn = ref(false);
  const status = ref(true);
  const userId = ref('hh')

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

const setView = () =>{ 
axios({
    url:'/users/profile/{userId}'
}).then(result => {
  console.log(result.data.user)
  status.value = result.data.uesr.status
})
}

  const toggleView = () => {
    status.value = !status.value;
    
  };

  return {
    teamname,
    username,
    title,
    account,
    status,
    isLoggedIn,
    setTitle,
    setUsername,
    setAccount,
    logout,
    setView,
    toggleView,
  };
});
