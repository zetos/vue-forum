<template>
  <div class="col-full">
    <h1>Welcome to the Category</h1>
    <CategoryList :categories="categories" />
  </div>
</template>

<script>
import CategoryList from '@/components/CategoryList';

export default {
  name: 'ViewHome',
  components: {
    CategoryList
  },
  computed: {
    categories() {
      return Object.values(this.$store.state.categories);
    }
  }
};
</script>
