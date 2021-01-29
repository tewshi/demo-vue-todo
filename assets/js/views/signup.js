/** @format */

const SignupView = {
  name: 'Signup',
  data() {
    return {
      user: { name: '', username: '', password: '' },
      messages: { name: '', username: '', password: '' },
      loading: false,
    }
  },
  mounted() {
    window.localStorage.clear()
  },
  methods: {
    signup() {
      const { name, username, password } = this.user
      const fd = new FormData()
      fd.append('name', name)
      fd.append('username', username)
      fd.append('password', password)
      this.loading = true
      fetch('/api.php?action=signup', { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then((response) => response.json())
        .then((data) => {
          if (data.status !== 'success') {
            this.messages[data.key] = data.message
            this.loading = false
          } else {
            localStorage.setItem('todos', JSON.stringify([]))
            localStorage.setItem('user', JSON.stringify(data.data))
            this.$router.push({ name: 'home' })
          }
        })
        .catch((error) => {
          this.loading = false
          console.log(error)
        })
    },
  },
  template: `<div class="col-lg-5">
  <div class="card bg-secondary shadow border-0">
    <div class="card-header bg-white pb-5">
      <div class="text-muted text-center mb-3">Signup in with</div>
      <div class="btn-wrapper text-center">
        <a href="#" class="btn btn-neutral btn-icon">
          <span class="btn-inner--icon"
            ><img src="/assets/img/icons/common/github.svg"
          /></span>
          <span class="btn-inner--text">Github</span>
        </a>
        <a href="#" class="btn btn-neutral btn-icon">
          <span class="btn-inner--icon"
            ><img src="/assets/img/icons/common/google.svg"
          /></span>
          <span class="btn-inner--text">Google</span>
        </a>
      </div>
    </div>
    <div class="card-body px-lg-5 py-lg-5">
      <div class="text-center text-muted mb-4">
        <small>Or sign up with credentials</small>
      </div>
      <form role="form" class="js-login-form" @submit.prevent="signup">
        <div class="form-group mb-3">
          <div class="input-group input-group-alternative">
            <div class="input-group-prepend">
              <span class="input-group-text"
                ><i class="ni ni-paper-diploma"></i
              ></span>
            </div>
            <input
              v-model.trim="user.name"
              class="form-control"
              placeholder="e.g John Doe"
              type="text"
              id="js-name-input"
              autocomplete="name"
              :disabled="loading"
              required
            />
          </div>
          <p id="name-message">{{messages.name}}</p>
        </div>

        <div class="form-group mb-3">
          <div class="input-group input-group-alternative">
            <div class="input-group-prepend">
              <span class="input-group-text"
                ><i class="ni ni-single-02"></i
              ></span>
            </div>
            <input
              v-model.trim="user.username"
              class="form-control"
              placeholder="e.g john"
              type="text"
              id="js-username-input"
              autocomplete="username"
              :disabled="loading"
              required
            />
          </div>
          <p id="username-message">{{messages.username}}</p>
        </div>

        <div class="form-group focused">
          <div class="input-group input-group-alternative">
            <div class="input-group-prepend">
              <span class="input-group-text"
                ><i class="ni ni-lock-circle-open"></i
              ></span>
            </div>
            <input
              v-model="user.password"
              class="form-control"
              placeholder="Password"
              type="password"
              id="js-password-input"
              :disabled="loading"
              required
            />
          </div>
          <p id="password-message">{{messages.password}}</p>
        </div>

        <div class="text-center">
          <button
            id="js-submit"
            type="submit"
            class="btn btn-primary btn-block mt-4"
            :disabled="loading"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  </div>
  <div class="row mt-3">
    <div class="col-6">
      <a href="#" class="text-light"> 
        <small>Forgot password?</small>
      </a>
    </div>
    <div class="col-6 text-right">
      <router-link :to="{name: 'login'}" class="text-light">
        <small>Login</small>
      </router-link>
    </div>
  </div>
</div>`,
}
