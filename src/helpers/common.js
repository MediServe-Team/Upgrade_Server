// format DateTime -> DD-MM-YYYY
export const formatDate = (dateTime) => {
  const date = dateTime.getDate();
  const month = dateTime.getMonth() + 1;
  const year = dateTime.getFullYear();
  return `${date}-${month}-${year}`;
};
