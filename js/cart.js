const { createApp } = Vue;
const apiUrl='https://vue3-course-api.hexschool.io';
const apiPath='leo533';

const productModal={
  //當id變動時，取得遠端資料，並呈現modal
  props:['id','addToCart','openModal','loadingItem'],
  data(){
    return{
      modal:{},
      tempProduct:{},
      qty:1,
      modalLoading: ''
    }
  },
  template: '#userProductModal',
  watch:{
    id(){
      console.log('productmodal',this.id);
      if(this.id){
        this.modalLoading = this.id;
        this.changeLoading();
        axios.get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
        .then(res=>{
          console.log('單一產品:',res);
          this.tempProduct=res.data.product;
          this.modal.show();
          this.modalLoading = '';
          this.changeLoading();
        })
      }
      console.log('gg');
    }
  },
  methods:{
    hide(){
      this.modal.hide();
    },
    changeLoading() {
      this.$emit('changeLoading', this.modalLoading);
    }
  },
  mounted(){
    this.modal = new bootstrap.Modal(this.$refs.modal);
    this.$refs.modal.addEventListener('hidden.bs.modal', (event) =>{
      this.openModal('');
    })
    // this.modal.show();
  }
}
//  讀取外部的資源
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
  VeeValidateI18n.loadLocaleFromURL("../zh_TW.json");
});

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});
const app=createApp({
  data(){
    return{
      products:[],
      productId: '',
      cart: {},
      loadingItem:'',
      form:{
        email:'',
        name:'',
        phone: '',
        address:'',
        msg: ''
      }
    }
  },
  methods:{
    getProducts() {
      axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`)
      .then(res=>{
        console.log('產品列表:',res);
        this.products=res.data.products;
      })
    },
    openModal(id){
      this.productId=id;
      console.log('外層帶入',id);
    },
    addToCart(product_id,qty=1){
      const data={
        product_id,
        qty
      };
      //{data:data}
      this.loadingItem = product_id + '1';
      axios.post(`${apiUrl}/v2/api/${apiPath}/cart`,{data})
      .then(res=>{
        console.log('加入購物車:',res);
        // this.products=res.data.products;
        console.log(this.$refs);
        this.$refs.productModal.hide();
        this.getCarts();
        this.loadingItem='';
        alert('商品已加入購物車');
      })

    },
    getCarts() {
      axios.get(`${apiUrl}/v2/api/${apiPath}/cart`)
      .then(res=>{
        console.log('購物車:',res);
        this.products=res.data.products;
        this.cart=res.data.data;
        this.getProducts();
      })
    },
    updateCartItem(item){//購物車的id,產品的id
      const data={
        product_id:item.product.id,
        qty:item.qty
      }
      this.loadingItem = item.id;
      console.log(data,item.id);
      axios.put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`,{ data })
      .then(res=>{
        console.log('更新購物車清單:',res);
        this.getCarts();
        this.loadingItem ='';
      })
    },
    deleteItem(item){
      this.loadingItem = item.id;
      axios.delete(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`)
      .then(res=>{
        console.log('刪除項目:',res);
        this.getCarts();
        this.loadingItem ='';
        alert('該商品已經清空');
      })
    },
    clearCart(){
      if(this.cart.carts.length===0){
        alert('購物車清單內為空');
        return;
      }
      else{
        this.loadingItem = 'deleteAll';
        axios.delete(`${apiUrl}/v2/api/${apiPath}/carts`)
        .then(res=>{
          console.log('清空購物車:',res);
          this.getCarts();
          this.loadingItem ='';
          alert('購物車已清空');
        })
      }
    },
    changeLoading(modalLoading) {
      this.loadingItem = modalLoading;
    },
    sendOrder(){
       console.log(this.cart.carts.length);
       if(this.cart.carts.length===0){
         alert('購物車清單內為空');
         return;
       }
       else{
         const data={
             "user": {
               "name": this.form.name,
               "email": this.form.email,
               "tel": this.form.phone,
               "address": this.form.address
             },
             "message": this.form.msg
         }
         axios.post(`${apiUrl}/v2/api/${apiPath}/order`,{data})
         .then(res=>{
           console.log('送出訂單:',res);
           this.getCarts();
           this.loadingItem ='';
           this.$refs.form.resetForm();
           alert('訂單已送出');
         })
      }
     }

  },
  mounted(){
    this.getProducts();
    this.getCarts();
  },

});


app.component('productModal',productModal);

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
app.mount('#app');