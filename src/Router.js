export default class Router {
  constructor(routes) {
    this.state = {
      routerActive: window.location.pathname
    }
    this.attachEvent(document.getElementById('routers'), routes);
    this.getStatusRouterLink(document.querySelectorAll('[routerLink]'));
  }

  routerLink(routes, evt) {
    const target = evt.target;

    if (target.attributes[0]) {
      const route = target.attributes[0].value;
      const [router] = routes.filter(router => router.path === route);
      
      if (!router) {
        window.history.pushState({}, '', '404');
      } else {
        window.history.pushState({}, 'name', router.path);
        this.routerLinkActive(target);
      }
    }
  }

  routerLinkActive(buttonRouter) {
    const activeList = document.querySelectorAll('[routerLinkActive]');

    activeList.forEach(item => {
      if (item.attributes[0]) {
        item.removeAttribute('routerLinkActive');
      }
    });

    if (buttonRouter.getAttribute('routerLink')) {
      buttonRouter.setAttribute('routerLinkActive', 'active');
    }
  }

  getStatusRouterLink(links) {
    for (let i = 0; i < links.length; i+=1) {
      const routerLink = links[i];

      if (routerLink.attributes.routerLink.value === this.state.routerActive) {
        routerLink.setAttribute('routerLinkActive', 'active');
      }
    }
  }

  attachEvent(selector, routes) {
    selector.addEventListener('click', this.routerLink.bind(this, routes));
  }
}