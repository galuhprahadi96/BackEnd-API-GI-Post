// import data model
const {
  getHistoryById,
  getAllHistory,
  countHistory,
  countHistoryOrder,
  countTotalPriceOrder,
  countTotalPrice,
} = require("../model/history");
const { getOrderById } = require("../model/order");

const qs = require("querystring");
// import helper
const helper = require("../helper/index.js");
const { request } = require("express");

// logic prevlink pagination
const getPrevLink = (page, currentQuery) => {
  if (page > 1) {
    const generatedPage = {
      page: page - 1,
    };
    const resultPrevLink = { ...currentQuery, ...generatedPage };
    return qs.stringify(resultPrevLink);
  } else {
    return null;
  }
};

const getNextLink = (page, totalPage, currentQuery) => {
  if (page < totalPage) {
    const generatedPage = {
      page: page + 1,
    };
    const resultNextLink = { ...currentQuery, ...generatedPage };
    return qs.stringify(resultNextLink);
  } else {
    return null;
  }
};
// end logic pagination
module.exports = {
  getAllHistory: async (req, res) => {
    let { page, limit } = req.query;
    let pageNumber = page === undefined ? 1 : page;
    let limitItem = limit === undefined ? 5 : limit;

    pageNumber = parseInt(pageNumber);
    limitItem = parseInt(limitItem);

    let totalData = await countHistory();
    let totalPage = Math.ceil(totalData / limitItem);
    let offset = pageNumber * limitItem - limitItem;
    let prevLink = getPrevLink(pageNumber, req.query);
    let nextLink = getNextLink(pageNumber, totalPage, req.query);
    const pageInfo = {
      pageNumber, // page: page
      totalPage,
      limitItem,
      totalData,
      prevLink: prevLink && `http://127.0.0.1:3001/history?${prevLink}`,
      nextLink: nextLink && `http://127.0.0.1:3001/history?${nextLink}`,
    };
    try {
      const result = await getAllHistory(limitItem, offset);

      for (let i = 0; i < result.length; i++) {
        result[i].orders = await getOrderById(result[i].history_id);
      }
      return helper.response(res, 200, "Success Get history", result, pageInfo);
    } catch (error) {
      return helper.response(res, 400, "Bad Request", error);
    }
  },

  // count order week
  getHistoryOrder: async (req, res) => {
    try {
      const result = await countHistoryOrder();
      if (result > 0) {
        data = {
          totalOrders: result,
        };
      } else {
        data = {
          totalOrders: 0,
        };
      }
      return helper.response(res, 200, "Success count orders", data);
    } catch (error) {
      return helper.response(res, 400, "Bad Request", error);
    }
  },

  //total order per tahun
  getTotalPrice: async (req, res) => {
    try {
      const result = await countTotalPriceOrder();
      if (result > 0) {
        data = {
          incomeYear: result,
        };
      } else {
        data = {
          incomeYear: 0,
        };
      }
      return helper.response(res, 200, "Success get income orders year", data);
    } catch (error) {
      return helper.response(res, 400, "Bad Request", error);
    }
  },

  //total order per tahun
  getTotalOrderDay: async (req, res) => {
    try {
      const result = await countTotalPrice();
      if (result > 0) {
        data = {
          incomeDay: result,
        };
      } else {
        data = {
          incomeDay: 0,
        };
      }
      return helper.response(res, 200, "Success get income order day", data);
    } catch (error) {
      return helper.response(res, 400, "Bad Request", error);
    }
  },

  // ambil data
  getHistoryById: async (req, res) => {
    try {
      const id = req.params.id;
      const history = await getHistoryById(id);
      const orders = await getOrderById(id);
      const result = [{ ...history[0], orders }];
      return helper.response(res, 200, `Success Get history id ${id}`, result);
    } catch (error) {
      return helper.response(res, 400, "Bad Request", error);
    }
  },
};
