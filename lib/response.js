exports.sendResponse = (Success, Message, Data) => {
  //1 = good
  //0 = bad
  //if success is 0, no data :d
  let res = {
    Success: Success,
    Message: Message,
    Data: Data,
  };
  if (Success === 0) {
    res = {
      Success: Success,
      Message: Message,
    };
  }
  return res;
};
