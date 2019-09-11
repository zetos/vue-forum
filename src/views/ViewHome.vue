<template>
  <div v-if="ready" class="col-full push-top">
    <h1>Welcome to the Category</h1>
    <CategoryList :categories="categories" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import CategoryList from '@/components/CategoryList';
import { Promise } from 'q';

export default {
  name: 'ViewHome',
  components: {
    CategoryList
  },
  data() {
    return {
      ready: false
    };
  },
  computed: {
    categories() {
      return Object.values(this.$store.state.categories);
    }
  },
  methods: {
    ...mapActions(['fetchAllCategories', 'fetchForums'])
  },
  created() {
    this.fetchAllCategories().then(categories => {
      Promise.all(
        categories.map(category =>
          this.fetchForums({
            ids: Object.keys(category.forums)
          })
        )
      ).then(() => {
        this.ready = true;
      });
    });
  }
};
</script>
