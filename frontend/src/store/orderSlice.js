import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: null,
    totalOrders: null,
    loading: true,
    error: null,
    shopifyLoading: true,
    shopifyError: null,
    amazonLoading: true,
    amazonError: null,
    pendingOrders: [],
    shopifyPendingOrders: [],
    shopifyOrder: [],
    shopifyTotalOrders: null,
    amazonOrders: [],
    amazonTotalOrders: [],
    amazonPendingOrders: [],
    menifestItems: [],
    intransitItems: [],
    deliveredItems: [],
    cancelOrders:[],
    replacedOrders:[]
  },
  reducers: {
    fetchOrder(state, action) {
      state.order = action.payload;
    },
    fetchTotalOrders(state, action) {
      state.totalOrders = action.payload;
    },
   fetchPendingOrders(state, action) {
      state.pendingOrders = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },

    //shopify
    setShopifyLoading(state, action) {
      state.shopifyLoading = action.payload;
    },
    setShopifyError(state, action) {
      state.shopifyError = action.payload;
    },

    fetchShopifyTotalOrders(state, action) {
      state.shopifyTotalOrders = action.payload;
    },
    fetchShopifyOrder(state, action) {
      state.shopifyOrder = action.payload;
    },
    fetchShopifyPendingOrders(state, action) {
      state.shopifyPendingOrders = action.payload;
    },

    //amazon
    setAmazonLoading(state, action) {
      state.amazonLoading = action.payload;
    },
    setAmazonError(state, action) {
      state.amazonError = action.payload;
    },

    fetchAmazonOrders(state, action) {
      state.amazonOrders = action.payload;
    },
    fetchAmazonTotalOrders(state, action) {
      state.amazonTotalOrders = action.payload;
    },
    fetchAmazonPendingOrders(state, action) {
      state.amazonPendingOrders = action.payload;
    },

    fetchMenifestItems(state, action) {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.menifestItems = [...state.menifestItems, ...payload];
      } else {
        state.menifestItems = [...state.menifestItems, payload];
      }
    },
removeManifestItem(state, action) {
    const itemIdToRemove = action.payload;
    state.menifestItems = state.menifestItems.filter(itemWrapper =>
      itemWrapper?.data?.order?.orderItems?.findIndex(item => item._id === itemIdToRemove) === -1
    );
  },
    fetchIntransitItems(state, action) {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.intransitItems = [...state.intransitItems, ...payload];
      } else {
        state.intransitItems = [...state.intransitItems, payload];
      }
    },
    removeIntransitItem(state, action) {
    const intransitIdToRemove = action.payload;
    state.intransitItems = state.intransitItems.filter(itemWrapper =>
      itemWrapper?.data?.order?.orderItems?.findIndex(item => item._id === intransitIdToRemove) === -1
    );
  },
    fetchDeliveredItems(state, action) {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.deliveredItems = [...state.deliveredItems, ...payload];
      } else if (payload.orderItems) {
        const deliveredItems = payload.orderItems.filter(
          (item) => item.status === "delivered"
        );
        state.deliveredItems = [...state.deliveredItems, ...deliveredItems];
      } else {
        state.deliveredItems = [...state.deliveredItems, payload];
      }
    },
    removeDeliveredItem(state, action) {
  const orderIdToRemove = action.payload;
  state.deliveredItems = state.deliveredItems.filter(item => {
   
    if(item.orderId){
        return item.orderId !== orderIdToRemove;
    }
    else{
        return true; //keep the item if it does not have orderId
    }

  });
},
    fetchCancelItems(state, action) {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.cancelOrders = [...state.cancelOrders, ...payload];
      } else {
        state.cancelOrders = [...state.cancelOrders, payload];
      }
    },
     removePendingOrder(state, action) {
      const orderIdToRemove = action.payload;
      state.pendingOrders = state.pendingOrders.filter(
        (order) => order._id !== orderIdToRemove
      );
    },

    fetchReplacedItems(state, action) {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.replacedOrders = [...state.replacedOrders, ...payload];
      } else {
        state.replacedOrders = [...state.replacedOrders, payload];
      }
    },
    removeReplacedItem(state, action) {
    const replacedIdToRemove = action.payload;
    state.replacedOrders = state.replacedOrders.filter(itemWrapper =>
      itemWrapper?.data?.order?.orderItems?.findIndex(item => item._id === replacedIdToRemove) === -1
    );
  },
  },
});

export const {
  fetchOrder,
  fetchTotalOrders,
  fetchPendingOrders,
  setLoading,
  setError,
  setShopifyLoading,
  setShopifyError,
  fetchShopifyOrder,
  fetchShopifyTotalOrders,
  fetchShopifyPendingOrders,
  setAmazonLoading,
  setAmazonError,
  fetchAmazonOrders,
  fetchAmazonTotalOrders,
  fetchAmazonPendingOrders,
  fetchMenifestItems,
  fetchIntransitItems,
  fetchDeliveredItems,
  fetchCancelItems,
  removeManifestItem,
  removeIntransitItem,
  removePendingOrder,
  fetchReplacedItems,
  removeReplacedItem,
  removeDeliveredItem
} = orderSlice.actions;
export default orderSlice.reducer;