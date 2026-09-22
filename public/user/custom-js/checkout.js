
const checkoutForm = document.querySelector('#checkout-order');
let selectPaymentMethod = 'payment-1';
var formData = {};
var userId;
let deliveryCharge = ( productTotal < 500 ) ? 50 : 0;
productTotal = parseInt(productTotal) + parseInt(deliveryCharge);
var originalPrice = productTotal;
let couponApplied = false, confi = false;
var discountPrice = 0;

checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const landmark = document.querySelector('.landmark');
  const orderNotes = document.querySelector('.order-notes');
  

    userId = event.target.dataset.userId;

    for (const input of event.target.elements) {
        if (input.tagName !== 'INPUT' || !input.name) {
            continue;
        }
        formData[input.name] = input.value;
    }
    formData[landmark.name] = landmark.value;
    formData[orderNotes.name] = orderNotes.value;

    try{
        if(selectPaymentMethod === 'payment-1'){
          formData.paymentMethod = 'COD';
          checkoutSend(userId, formData)
        }else if(selectPaymentMethod === 'payment-2'){
            formData.paymentMethod = 'razorpay';
            const searchParams = new URLSearchParams(formData);
            const response = await fetch(`/checkout-validation?${searchParams.toString()}`);
            const body = await response.json();
            if(body.error) return failureMessage(body.error);
            await razorpay();
        }else if(selectPaymentMethod === 'payment-3'){
            formData.paymentMethod = 'wallet';
            checkoutSend(userId, formData);
        }else {
            failureMessage('select a payment method to continue');
        }
    }catch(err){
        console.log(err);
    }
});
async function checkoutSend(userId, formData, orderId) {
  formData.orderId = orderId;
  try {
    const response = await fetch(`/checkout/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const body = await response.json();
    if (body.error) {
      return failureMessage(body.error);
    } else {
      successMessage('Order was successful');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    }
  } catch (err) {
    console.log(err);
  }
}


async function rzrErrorOrderPending(userId, orderId ) {
  try {
    formData.orderId = orderId;
    const response = await fetch(`/checkout-error/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const body = await response.json();
    if (body.error) {
      return failureMessage(body.error);
    } else {
      failureMessage('Payment was unsuccessful, you can countinue it from orders page.');
      setTimeout(() => window.location.href = '/dashboard', 2000 );
    }
  } catch (err) {
    console.log(err);
  }
}




const paymentOptions = document.querySelectorAll('[select-payment-method]');
paymentOptions.forEach( option => {
    option.addEventListener('click', (event) => {
        selectPaymentMethod = option.id;
        if(selectPaymentMethod == 'payment-1'){
        }else if(selectPaymentMethod == 'payment-2'){
        }else if(selectPaymentMethod == 'payment-3'){
        }else {
            failureMessage('select a payment method to continue');
        }
    });
});



const btnApplyCoupon = document.querySelector('.btn-apply-coupon');
btnApplyCoupon.addEventListener('click', async function(event) {
  // const response = await fetch('/checkout/apply-coupon');

  const couponCode = document.querySelector('#checkout-discount-input').value;

    if((couponCode || couponCode !== '') && !couponApplied ){
      const responseCoupon = await fetch(`/coupon/check/${couponCode}/${productTotal}`);
      const bodyCoupon = await responseCoupon.json();
      if(!bodyCoupon.status) failureMessage(bodyCoupon.error);
      if(bodyCoupon.status){
        couponApplied = true;
        discountPrice = productTotal - bodyCoupon.discountPrice;
        formData.discountPrice = discountPrice ;
        formData.couponApplied = true;
        formData.couponCode = couponCode;
        productTotal = bodyCoupon.discountPrice;
        successMessage(`you got a discount of ${originalPrice - productTotal}`);
        document.querySelector('#totalPrice').innerHTML = `$${ (originalPrice - discountPrice) }`;
        const summerTotal = document.querySelector('.summary-total');
        const tr = `<tr class="tr-coupon">
                      <td>couponOffer </td>
                      <td>- $${bodyCoupon.couponOffer}</td>
                    </tr>
                    <tr class="tr-coupon" ><td colspan="2"><button class="btn btn-warning remove-coupon container-fluid" onclick="removeCoupon()" type="button" data-coupon-code="${bodyCoupon.couponOffer}"> Remove ${bodyCoupon.couponCode} </button></td></tr>`
        summerTotal.insertAdjacentHTML('beforebegin', tr);
      } 
    }else if(!couponCode || couponCode == "" ) return failureMessage('Enter coupon code');
    else if(couponApplied) failureMessage('A coupon is already applied, remove it to use another');
});


async function removeCoupon() {
  const response = await fetch(`/remove-coupon/${formData.couponCode}`);
  const body = await response.json();
  if(body.error) failureMessage(body.error);
  else {
    successMessage(body.message);
    const couponRows = document.querySelectorAll('.tr-coupon');
    couponRows.forEach(row => row.remove());
    document.querySelector('#totalPrice').innerHTML = `$${ originalPrice }`;
    productTotal = originalPrice;
    formData.discountPrice = 0;
    formData.couponApplied = false;
    couponApplied = false
  }
}


function confirmIt( message, btnText ) {
  const result = Swal.fire({
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: btnText || "OK",
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



  


async function razorpay(){
  try {
    await loadRazorpayCheckout();
    const createOrderResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: formData.couponCode }),
    });
    const response = await createOrderResponse.json();
    if (!createOrderResponse.ok || response.error) return failureMessage(response.error || 'Unable to create payment order.');

        const orderId = response.order_id;
        $("button").show();
  
        var options = {
          "key": response.key_id,
          "amount": response.amount,
          "currency": response.currency,
          "name": "Margin",
          "description": "Test Transaction",
          "image": "https://example.com/your_logo",
          "order_id": orderId,
          "handler": async function(providerResponse) {
            const verificationResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: providerResponse.razorpay_payment_id,
                razorpay_order_id: providerResponse.razorpay_order_id,
                razorpay_signature: providerResponse.razorpay_signature,
              }),
            });
            const verification = await verificationResponse.json();
            if (!verificationResponse.ok || verification.error) return failureMessage(verification.error || 'Payment could not be verified.');
            checkoutSend(userId, {
              ...formData,
              razorpayPaymentId: providerResponse.razorpay_payment_id,
              razorpaySignature: providerResponse.razorpay_signature,
            }, orderId);
          },
          "prefill": {
            "name": "Muhammed Alishan",
            "email": "alishan.example@gmail.com",
            "contact": "0000000000"
          },
          "notes": {
            "address": "Razorpay Corporate Office"
          },
          "config": {
            "display": {
              "blocks": {
                "upi_block": {
                  "name": "Pay via UPI",
                  "instruments": [{ "method": "upi" }]
                },
                "cards": {
                  "name": "Cards",
                  "instruments": [{ "method": "card" }]
                },
                "netbanking": {
                  "name": "Netbanking",
                  "instruments": [{ "method": "netbanking" }]
                },
                "wallets": {
                  "name": "Wallets",
                  "instruments": [{ "method": "wallet" }]
                }
              },
              "sequence": ["block.upi", "block.cards", "block.netbanking", "block.wallets"],
              "preferences": {
                "show_default_blocks": true
              }
            }
          },
          "theme": {
            "color": "#3399cc"
          },
          "modal": {
            "ondismiss": function() {}
          }
        };
  
        var rzp1 = new Razorpay(options);

        rzp1.on('payment.failed', function(response) {
          failureMessage(response.error && response.error.description ? response.error.description : 'Payment failed. Please try again.');
        });

        rzp1.on('payment.error', function (response) {
          console.log('Payment error:', response.error);
        });

        rzp1.open();
  } catch (err) {
    console.log(err);
    failureMessage('Unable to start Razorpay checkout. Please try again.');
  }
  return true;
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'));
    document.head.appendChild(script);
  });
}
