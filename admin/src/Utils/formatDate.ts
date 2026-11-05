export const formatDate = (dateString: string | undefined) => {

  if(!dateString) return
    const date = new Date(dateString);
  
    const day = date.getDate();
    const dayWithSuffix =
      day +
      (day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th");
  
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  
    return formattedDate.replace(/\d+/, dayWithSuffix);
  };