(function() {
    emailjs.init("Ag0jrex2npsG3CnBp");
  })();
  
  function sendInvite() {
    const email = document.getElementById("email").value.trim();
    const messageDiv = document.getElementById("message");
  
    if (!email || !email.includes("@") || !email.endsWith(".com")) {
      messageDiv.innerHTML = '<p class="error">❌ Enter a valid Gmail address.</p>';
      return;
    }
  
    const roomId = Math.random().toString(36).substring(2, 10);
    const guestLink = `https://myedumate.live/session.html?room=${roomId}#guest`;
  
    emailjs.send("service_tqfc2an", "template_sq8nbbk", {
      room_link: guestLink,
      to_email: email,
    }).then(() => {
      messageDiv.innerHTML = '<p class="success">✅ Invite sent! Redirecting...</p>';
      window.location.href = `session.html?room=${roomId}#host`;
    }).catch(error => {
      console.error("EmailJS error:", error);
      messageDiv.innerHTML = '<p class="error">❌ Failed to send invite.</p>';
    });
  }
  