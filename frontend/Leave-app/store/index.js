// store/index.js
export const state = () => ({
    page: 'AdminManagementPage'
  });
  
  export const mutations = {
    updatePage(state, newPage) {
      state.page = newPage;
    }
  };
  
  export const actions = {
    updatePage({ commit }, newPage) {
      commit('updatePage', newPage);
    }
  };
  
  export const getters = {
    page(state) {
      return state.page;
    }
  };
  