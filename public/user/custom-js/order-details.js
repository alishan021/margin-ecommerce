
const cancelOrderAll = document.querySelectorAll('.btn-item-cancel');
const returnOrderAll = document.querySelectorAll('.btn-item-return');



cancelOrderAll.forEach( cancelOrder => {

    // Cancel the order
    if(cancelOrder){

    cancelOrder.addEventListener('click', async ( event ) => {
        const productId = cancelOrder.parentElement.getAttribute('data-product-id');
        const orderId = cancelOrder.parentElement.getAttribute('data-order-id');
        const confi = await confirmIt('Are you sure that you want to cancel the order?', 'Yes');

        if(confi.isConfirmed){
            const response = await fetch(`/order/cancel/${orderId}/${productId}`, {
                method: 'PATCH',
                })
            const body = await response.json();
            if(body.error) failureMessage(body.error);
            else if(body.success) {
              successMessage(body.message);
                window.location.reload();
            } 
            if(!body.error){
                cancelOrder.style.display = 'none'
                document.querySelector('.btn-item-cancel').style.display = "none";
            }
        }
      });
    }
});


returnOrderAll.forEach((returnOrder) => {
  if (returnOrder) {
    returnOrder.addEventListener('click', async (event) => {
      const parentDiv = returnOrder.closest('.item-order-status');
      const productId = parentDiv.getAttribute('data-product-id');
      const orderId = parentDiv.getAttribute('data-order-id');
      const confi = await confirmIt('Are you sure that you want to return the product? \nThen your money will added to your wallet');
      if (confi.isConfirmed) {
        const response = await fetch(`/order/return/${orderId}/${productId}`, {
          method: 'PATCH',
        });
        const body = await response.json();

        if (body.error) {
          failureMessage(body.error);
        } else if (body.message) {
          successMessage(body.message);
          returnOrder.style.display = 'none';
          window.location.reload();
        }
      }
    });
  }
});




const btnInvoice = document.querySelector('#btn-invoice'); 
btnInvoice.addEventListener('click', async (event) => {
  const orderId = event.target.getAttribute('data-order-id');
  const response = await fetch(`/order/invoice/${orderId}`);

  if(response.ok) {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orderId}-invoice.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  }else {
    const body = await response.json();
  }
});


async function payAgain(event) {
  const orderId = event.target.dataset.orderId;
  const response = await fetch(`/failed-payment?orderId=${orderId}`);
  const body = await response.json();
  const { rzr_orderId, totalPrice } = body.order;
  await razorpay(rzr_orderId, totalPrice, body.order.userId );
}





async function razorpay(orderId, productTotal, userId){
  $(document).ready(function() {
    
          var options = {
            "key": "rzp_test_sHq1xf34I99z5x",
            "amount": productTotal*100,
            "currency": "INR",
            "name": "Margin",
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
            "order_id": orderId,
            "handler": function(response) {
              const result = rzrPaymentAgain(orderId, response);
              if(result) setTimeout(() => window.location.reload(), 1000);
              else return false;
            },
            "prefill": {
              "name": "Muhammed Alishan",
              "email": "alishan.example@gmail.com",
              "contact": "0000000000"
            },
            "notes": {
              "address": "Razorpay Corporate Office"
            },
            "theme": {
              "color": "#3399cc"
            }
          };
    
          var rzp1 = new Razorpay(options);
  
          rzp1.on('payment.failed', async function(response) {
            failureMessage('Payment failed, try Again');
          });
  
          rzp1.on('payment.error', function (response) {
            console.log('Payment error:', response.error);
          });
  
          rzp1.open();
    });
  }


  
  
async function rzrPaymentAgain(rzr_orderId, providerResponse) {
  const response = await fetch('/payment-pending', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rzr_orderId,
      razorpayPaymentId: providerResponse.razorpay_payment_id,
      razorpaySignature: providerResponse.razorpay_signature,
    })
  });
  const body = await response.json();
  if(body.error) {
    failureMessage(body.error);
    return false;
  }
  else successMessage(body.message);
  return true;
}


  





function confirmIt( message ) {
  const result = Swal.fire({
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "OK",
    position: "top",
    customClass: {
      actions: 'custom-actions-class'
    }
  });
  return result;
}



function successMessage(message) {
  Swal.fire({
    text: message,
    position: 'top',
    timer: 2000,
    background: 'green',
    color: 'white',
    showConfirmButton: false
  });
  return;
}


function failureMessage(message) {
  Swal.fire({
    text: message,
    position: 'top',
    timer: 2000,
    background: 'red',
    color: 'white',
    showConfirmButton: false
  });
  return;
}
