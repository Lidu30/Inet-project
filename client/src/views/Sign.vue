<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="checkLogin()">
      <label for="username" class="form-label h4">Welcome</label>
      <p></p>
      <input
        id="username"
        v-model="username"
        type="text"
        class="form-control"
        placeholder="Username..."
        required
      />
      <p></p>
      <input
        id="password"
        v-model="password"
        type="password"
        class="form-control"
        placeholder="Password..."
        required
      />
      <label> 
        <input
            v-model = "role"
            type = "radio"
            value = "Student"
        /> 
        Student
      </label> 

      <label>
        <input
            v-model = "role"
            type = "radio"
            value = "Assistant"
        /> 
        Assistant
      </label> 
      <p>Selected: {{ role }}</p>  
      <p v-if="msg" class="alert alert-danger">{{ msg }}</p>
      <button type="submit" class="btn btn-dark mt-4 float-end">sign up </button>
    </form>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  components: {},
  data: () => ({
    username: "",
    password: "",
    msg: "",
    role:"",
  }),

  created() {
    // Check if already authenticated
    this.checkAuthStatus();
  },

  methods: {

    Signup() {
      if (this.username.length >= 3 && this.password.length >= 3) {
        fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
            role:this.role
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.signupSuccess) {
              this.msg = "sign up successful, please Log in to continue forward"
              this.$router.push("/Login");
            } else {
              this.msg = "Sign up failed please try again"
            }
          })
          .catch((error) => {
            console.error("Signup error:", error);
            this.msg = "Signup failed. Please try again.";
          });
      } else {
        this.msg = "Username and password must be at least 3 characters and contain at least one letter and 1 character";
      }
    },
  },
};
</script>
