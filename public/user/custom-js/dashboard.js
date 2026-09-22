
const userDetailsForm = document.querySelector('.user-details-form');

userDetailsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formDetils = $('.user-details-form').serialize();

    const response = await fetch('/dashboard/user-details', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        //  'Content-Type': 'application/json'
        },
        body: formDetils
    })
    const data = await response.json();
    if(data.error){
        return failureMessage(data.error);
    }else if(data.success){
        // window.location.href = '/dashboard';
        return successMessage(data.message);
    }
});



const addressForm = document.querySelector('[address-add]');

addressForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {};
    const landmark = document.querySelector('.landmark');
    const userId = event.target.dataset.userId;

    for (const input of event.target.elements) {
        if (input.tagName !== 'INPUT' || !input.name) {
            continue;
        }
        formData[input.name] = input.value;
    }
    formData[landmark.name] = landmark.value;
    try{
        const response = await fetch(`/address/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const body = await response.json()
        if(body.error){
            return failureMessage(body.error);
        }else if(body.success){
            successMessage(body.message)
            setTimeout(() => window.location.href = '/dashboard', 1000);
        }
    }catch(err){
        console.log(err);
    }
});


const deleteBtn = document.querySelectorAll('.btn-delete')

deleteBtn.forEach( button => {
    button.addEventListener('click', async (event) => {
        try{
            // event.Propagation();
            const addressId = button.getAttribute('data-address-id');
            if(addressId){
                const confi = await confirmIt('are you sure, you want to delete the address', 'Delete');
                if(!confi.isConfirmed) return;
            }
            const response = await fetch(`/address/${addressId}`,{ method: 'DELETE'})
            const body = await response.json()
            if(body.success){
                successMessage(body.message);
                setTimeout(() => window.location.href = '/dashboard', 1000);
            }else {
                failureMessage(body.error);
            }
        }catch(err){
            console.error(err);
        }
    })
});



const navLinks = document.querySelectorAll('.nav-link');
const editDiv = document.querySelector('[edit-div]');
const editButtons = document.querySelectorAll('.btn-edit');
const tabPane = document.querySelectorAll('.tab-pane');
const editLink = document.querySelector('[edit-link]');
const editAddress = document.querySelector('[address-edit]');

editButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
        try {
            const addressId = button.getAttribute('data-address-id');
            const index = button.getAttribute('data-index');
            
            const confi = await confirmIt('Are you sure you want to edit this address?', 'Edit');
            if (!confi.isConfirmed) return;

            tabPane.forEach( item => item.classList.remove('show', 'active'));
            editDiv.classList.add('show', 'active');
            navLinks.forEach( item => item.classList.remove('active'));
            editLink.setAttribute('aria-selected', 'true');
            editLink.classList.add('active')

            const response = await fetch(`/address/edit/${addressId}`);
            
            // Parse JSON response
            const body = await response.json();
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    const value = body[key];
                    const inputElement = document.getElementById(key);
                    if (inputElement) {
                        inputElement.value = value;
                    }
                }
            }
            const landmark = document.querySelector('#landmark');
            landmark.value = body.landmark;

            editAddress.addEventListener('submit', async (event) => {
                event.preventDefault();
                try{
                    const formData = {};
                    const userId = event.target.dataset.userId;

                    for (const input of event.target.elements) {
                        if (input.tagName !== 'INPUT' || !input.name) {
                            continue;
                        }
                        formData[input.name] = input.value;
                    }
                    formData[landmark.name] = landmark.value;
                
                        const responseUpdate = await fetch(`/address/update/${addressId}/${userId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        })
                        const bodyupdate = await responseUpdate.json()
                        if(bodyupdate.error){
                            return failureMessage(bodyupdate.error);
                        }
                        if(bodyupdate.success){
                            successMessage(bodyupdate.message);
                            setTimeout(() => window.location.href = '/dashboard', 1000);
                        }
                }catch(err){
                    console.log(err);
                }
            })

        } catch (err) {
            console.log(err);
        }
    });
});



const addAddress = document.querySelector('.add-address-link');
const addLink = document.querySelector('add-link');
const addDiv = document.querySelector('[add-div]');

addAddress.addEventListener('click', (event) => {
    // event.preventDefault();
    tabPane.forEach( item => item.classList.remove('show', 'active'));
    addDiv.classList.add('show', 'active');
    navLinks.forEach( item => item.classList.remove('active'));
    addLink.setAttribute('aria-selected', 'true');
    addLink.classList.add('active');

})



const orderBoxs = document.querySelectorAll('.order-box');

orderBoxs.forEach(orderBox => {
    orderBox.addEventListener('click', async (event) => {
        const orderId = orderBox.getAttribute('data-order-id');
        window.location.href = `/order/${orderId}`;
    });
});





function confirmIt( message, confirmText ) {
    const result = Swal.fire({
      text: message,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText,
      position: "top",
      customClass: {
        actions: 'custom-actions-class'
      }
    });
    return result;
  };



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

  




const btnWallet = document.querySelector('.btn-wallet');
btnWallet.addEventListener('click', (event) => {
    const amount = Number(document.querySelector('#wallet-amount').value);
    if (!Number.isInteger(amount) || amount <= 0) return failureMessage('Enter a whole amount greater than zero');
    razorpayWalletTopUp(amount);
})

async function razorpayWalletTopUp(amount) {
  try {
    await loadRazorpayCheckout();
    const response = await fetch('/wallet/top-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const body = await response.json();
    if (!response.ok || body.error) return failureMessage(body.error || 'Unable to start wallet top-up');

    const checkout = new Razorpay({
      key: body.key_id,
      amount: body.amount,
      currency: body.currency,
      name: 'Margin',
      description: 'Wallet top-up',
      order_id: body.order_id,
      handler: function() {
        Swal.fire({ text: 'Payment received. Your wallet will update once payment confirmation is processed.', icon: 'success' })
          .then(() => { window.location.href = '/dashboard'; });
      },
      prefill: {
        name: 'Muhammed Alishan',
        email: 'alishan.example@gmail.com',
        contact: '0000000000',
      },
      notes: { purpose: 'wallet_top_up' },
      theme: { color: '#3399cc' },
      modal: { ondismiss: function() {} },
    });
    checkout.on('payment.failed', function(providerResponse) {
      failureMessage(providerResponse.error && providerResponse.error.description ? providerResponse.error.description : 'Payment failed. Please try again.');
    });
    checkout.open();
  } catch (error) {
    console.error('Unable to start wallet top-up:', error);
    failureMessage('Unable to start wallet top-up');
  }
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
