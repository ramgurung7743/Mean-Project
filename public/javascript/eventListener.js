<script>
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('Click', function (event) {
        const clickedElement = event.target;
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');

        if (!navbarCollapse.classList.contains('show')) {
            return;
        }

        if (navbarToggler.contains(clickedElement) || navbarCollapse.contains(clickedElement)) {
            return;
        }
        navbarToggler.click();
    })
});
</script>
