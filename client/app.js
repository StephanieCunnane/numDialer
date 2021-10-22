const socket = new WebSocket("ws://localhost:3001");
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#list");
  document.body.appendChild(list);
  socket.onopen = function (e) {
    alert("[open] Connection established");
    alert("Sending to server");
  };

  socket.onmessage = (e) => {
    let callStatuses = JSON.parse(e.data);
    console.log(callStatuses);
    list.innerHTML = "";

    let keys = Object.keys(callStatuses);

    keys.forEach((key) => {
      let newLi = document.createElement("li");

      let phoneNumber = callStatuses[key].currentNum;
      let status = callStatuses[key].status;

      let textcontent = `Phone Number: ${phoneNumber} ----- Status: ${status}`;
      console.log(textcontent);

      newLi.textContent = textcontent;

      list.appendChild(newLi);
    });
  };
});
