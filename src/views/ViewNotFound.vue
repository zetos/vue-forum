<template>
  <div class="col-full">
    <h1>Page Not Found</h1>
    <p>
      Ooops, we couldn't find what you are looking for. Why don't you
      <router-link :to="{ name: 'ViewHome' }">go home instead?</router-link>
    </p>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
h1 {
  font-size: 100px;
}
p {
  font-size: 50px;
  font-weight: 100px;
}
div {
  text-align: center;
}
</style>
