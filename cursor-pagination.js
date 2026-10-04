(function (root) {
  let generation = 0;
  root.NSMissingPagination = {
    async fetchPage(query, cursor, pageSize, documentIdField) {
      let pageQuery = query.orderBy(documentIdField);
      if (cursor) pageQuery = pageQuery.startAfter(cursor);
      const snapshot = await pageQuery.limit(pageSize).get();
      const docs = snapshot.docs || [];
      return {
        docs,
        cursor: docs.length ? docs[docs.length - 1] : cursor,
        hasMore: docs.length === pageSize
      };
    },
    beginRequest() { generation += 1; return generation; },
    invalidateRequests() { generation += 1; return generation; },
    isCurrentRequest(token) { return token === generation; }
  };
})(window);
