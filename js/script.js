


const stripe = Stripe('pk_test_YOUR_PUBLIC_STRIPE_KEY'); // Replace with your Stripe public key

    const donateButton = document.getElementById('donate-button');
    const form = document.getElementById('donation-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const amount = document.getElementById('amount').value;

      // Call your backend to create a Stripe Checkout session
      const response = await fetch('/create-checkout-session.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, amount })
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        alert(result.error.message);
      }
    });