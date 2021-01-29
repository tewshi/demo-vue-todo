/** @format */

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },
  ],
})

new Vue({
  el: '#app',
  router,
  components: { AppNav, AppNavAuth },
  data() {
    return {
      user: {},
    }
  },
  mounted() {
    this.getUserFromStorage()
  },
  methods: {
    getUserFromStorage() {
      const userRef = localStorage.getItem('user')
      if (userRef) {
        this.user = JSON.parse(userRef)
      }
    },
  },
  watch: {
    '$route.name'(val, oldVal) {
      if (val === 'home') {
        this.getUserFromStorage()
      }
    },
  },
  template: `<div>
    <app-nav v-if="user && user.name" :user="user" />
    <app-nav-auth v-else />
    <section class="section section-shaped section-md mh-100vh">
      <div class="shape shape-style-1 bg-gradient-default">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="container">
        <h1 class="app-title">todos</h1>
        <div class="row justify-content-center">
          <router-view :user="user"/>
        </div>
      </div>
    </section>
  </div>`,
})
