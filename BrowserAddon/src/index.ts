import { el, text, mount, svg } from "redom";

type Comment = {
  storyId: number,
  storyTitle: string,
  commentId: number,
  parentId: number,
  rating: number,
  userName: string,
  avatarUrl: string,
  isAuthor: boolean,
  commentBody: string,
  dateTimeUtc: string,
}

const isDesktop = document.querySelector('.main__inner');
const mainInner = document.querySelector(isDesktop ? '.main__inner' : 'main')!;
const userName = mainInner.querySelector(isDesktop ? '.profile__nick *' : '.profile__nick')!.innerHTML.trim();
const storiesFeed = mainInner.querySelector(isDesktop ? '.stories-feed' : '.stories-feed') as HTMLElement;
const ratingsPane = mainInner.querySelector(isDesktop ? 'section.section_padding_left' : '.submenu.menu-mutiline') as HTMLElement;
const searchPane = mainInner.querySelector('.stories-search') as HTMLElement;
const pagination = mainInner.querySelector(isDesktop ? '.stories-feed-pagination' : '.paginator') as HTMLElement;
const commentsElement = mainInner.querySelector(isDesktop ? '.profile__section .profile__digital:nth-child(3)' : '.profile__numbers > div:nth-child(5)')!;
const postsElement = mainInner.querySelector(isDesktop ? '.profile__section .profile__digital:nth-child(4)' : '.profile__numbers > div:nth-child(7)')!;

const commentsContainer = createCommentsElement();
const commentsFeed = createCommentsFeedElement(commentsContainer);
mount(storiesFeed.parentNode!, commentsFeed, storiesFeed.nextSibling!);

let skipTill = Number.MAX_SAFE_INTEGER;

const times: [number, string, string, string][] = [
  [1, "секунда", "секунды", "секунд"],
  [60, "минута", "минуты", "минут"],
  [3600, "час", "часа", "часов"],
  [86400, "день", "дня", "дней"]
];

const NOW = new Date();

function timeAgo(date: Date) {
  let seconds = Math.round((NOW.getTime() - date.getTime()) / 1000);
  for (let t = times.length - 1; t > 0; t--) {
    const diff = Math.floor(seconds / times[t][0]);
    if (diff > 0) {
      const diff10 = diff % 10;
      const diff100 = diff % 100;
      const idx = (diff100 >= 10 && diff100 <= 20) ? 3 : ((diff10 === 1) ? 1 : ((diff10 <= 4) ? 2 : 3));
      return diff + " " + times[t][idx] + " назад";
    }
  }
  return "Только что";
}

function icon(name: string) {
  return (
    svg(`svg.icon.${name}.${name}_comments`,
      svg("use", { xlink: { href: `#${name}` } })
    )
  );
}

function renderDesktopRating(rating?: number) {
  if (rating || rating === 0) {
    return (
      el('div.comment__rating-count.hint',
        text((rating > 0 ? '+' : '') + rating)
      )
    );
  } else {
    return (
      el('div.comment__rating-count.hint', { ariaLabel: 'Рейтинг скрыт в течение 45 минут после добавления комментария' },
        icon('icon--ui__time')
      )
    );
  }
}

function renderMobileRating(rating?: number) {
  if (rating || rating === 0) {
    var className = '';
    if (rating > 0) className = '.comment__rating-count_plus';
    else if (rating < 0) className = '.comment__rating-count_minus';
    return (
      el('div.comment__right',
        el(`div.comment__rating-count${className}`,
          text((rating > 0 ? '+' : '') + rating)
        )
      )
    );
  } else {
    return (
      el('div.comment__right',
        el('div.comment__rating-count', { ariaLabel: 'Рейтинг скрыт в течение 45 минут после добавления комментария' },
          icon('icon--ui__time')
        )
      )
    );
  }
}

function renderAvatar(avatarUrl: string, user: string) {
  return (
    el('span.avatar.avatar_small.avatar_note',
      el('span.avatar__inner',
        avatarUrl ? el('img', { src: avatarUrl, alt: 'Аватар пользователя ' + user }) : el('span.avatar__default')
      )
    )
  );
}

function renderDesktopComment(storyId: number, commentId: number, parentId: number, rating: number, user: string, avatarUrl: string, isAuthor: boolean, commentBody: string, datetime: string) {
  const body = el('div.comment__content');
  body.innerHTML = commentBody;
  body.querySelectorAll("img").forEach((img: HTMLImageElement) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.classList.add("image-loaded");
    }
  });
  return (
    el('div.comment', { id: `comment_${commentId}`, dataId: commentId, dataMeta: `id=${commentId},pid=0,d=2019-01-03T14:21:43+03:00,de=0,ic=0,v=1,r=180,av=181:1,s,st`, dataIndent: '0' },
      el('div.comment__body',
        el('div.comment__header',
          renderDesktopRating(rating),
          el('div.comment__user', { dataProfile: true, dataName: user, dataOwnStory: isAuthor },
            el('a.user', { href: `/@${user}` },
              renderAvatar(avatarUrl, user)
            ),
            el('a', { href: `/@${user}` },
              el('span.user__nick', user)),
          ),
          el('time.comment__datetime.hint', { datetime: `${datetime}+00:00` }, `${timeAgo(new Date(datetime + "+00:00"))}`),
          el('div.comment__tools',
            el('a.comment__tool.hint', { dataRole: 'link', ariaLabel: 'Ссылка на комментарий', href: `https://pikabu.ru/story/_${storyId}?cid=${commentId}` },
              icon('icon--ui__link')
            ),
            el('div.comment__tool.hint', { dataRole: 'to-parent', style: { display: parentId === 0 ? 'none' : 'block' }, ariaLabel: 'Показать родительский комментарий' },
              icon('icon--ui__to-up')
            ),
            el('div.comment__tool.hint', { dataRole: 'branch', style: { display: parentId === 0 ? 'none' : 'block' }, ariaLabel: 'Показать/скрыть ветку комментариев' },
              icon('icon--ui__branch')
            ),
          ),
        ),
      ),
      body,
    )
  );
}

function renderCommentThread(storyId: number, storyTitle: string, commentId: number, parentId: number, rating: number, user: string, avatarUrl: string, isAuthor: boolean, commentBody: string, datetime: string) {
  return (
    el('div.comments.comments_show', { dataStoryId: storyId, dataIgnoreCode: 0 },
      el('div.comments__container',
        el('div.comments__title',
          el('a', { href: `https://pikabu.ru/story/_${storyId}#comments` },
            text(storyTitle)
          )
        ),
        el('div.comments__main',
          renderDesktopComment(storyId, commentId, parentId, rating, user, avatarUrl, isAuthor, commentBody, datetime)
        )
      )
    )
  );
};

function renderMobileComment(storyId: number, _storyTitle: string, commentId: number, parentId: number, rating: number, user: string, avatarUrl: string, isAuthor: boolean, commentBody: string, datetime: string) {
  const body = el('div.comment__content');
  body.innerHTML = commentBody;
  body.querySelectorAll("img").forEach((img: HTMLImageElement) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.classList.add("image-loaded");
    }
  });
  return (
    el('div.comment', { id: `comment_${commentId}`, dataId: commentId, dataMeta: `id=${commentId},pid=0,d=2019-01-03T14:21:43+03:00,de=0,ic=0,v=1,r=180,av=181:1,s,st`, dataIndent: '0' },
      el('div.comment__body',
        el('div.comment__header',
          el('a.user.user_inline.comment__user', { dataProfile: true, dataName: user, dataOwnStory: isAuthor, href: `/@${user}` },
            renderAvatar(avatarUrl, user),
            el('span.user__nick', user),
          ),
          el('time.comment__datetime.hint', { datetime: `${datetime}+00:00` }, `${timeAgo(new Date(datetime + "+00:00"))}`),
          renderMobileRating(rating),
          el('div.comment__tools',
            el('a.comment__tool.hint', { dataRole: 'link', ariaLabel: 'Ссылка на комментарий', href: `https://pikabu.ru/story/_${storyId}?cid=${commentId}` },
              icon('icon--ui__link')
            ),
            el('div.comment__tool.hint', { dataRole: 'to-parent', style: { display: parentId === 0 ? 'none' : 'block' }, ariaLabel: 'Показать родительский комментарий' },
              icon('icon--ui__to-up')
            ),
            el('div.comment__tool.hint', { dataRole: 'branch', style: { display: parentId === 0 ? 'none' : 'block' }, ariaLabel: 'Показать/скрыть ветку комментариев' },
              icon('icon--ui__branch')
            ),
          ),
        ),
        body,
      ),
    )
  );
}

function renderDesktopComments(comments: Comment[]) {
  comments
    .map(c => renderCommentThread(c.storyId, c.storyTitle, c.commentId, c.parentId, c.rating, userName, c.avatarUrl, c.isAuthor, c.commentBody, c.dateTimeUtc))
    .forEach(c => { mount(commentsContainer, c); })
}

function renderMobileComments(comments: Comment[]) {
  comments
    .map(c => renderMobileComment(c.storyId, c.storyTitle, c.commentId, c.parentId, c.rating, userName, c.avatarUrl, c.isAuthor, c.commentBody, c.dateTimeUtc))
    .forEach(c => { mount(commentsContainer, c); })
}

function showPosts() {
  commentsElement.classList.remove('peoplemeter-active');
  history.replaceState({}, document.title, window.location.href.split('#')[0]);
  storiesFeed.style.display = 'block';
  if (pagination) pagination.style.display = 'block';
  if (ratingsPane) ratingsPane.style.display = 'block';
  if (searchPane) searchPane.style.display = 'block';
  commentsFeed.style.display = 'none';
}

function createCommentsElement() {
  if (isDesktop) {
    return el('section');
  } else {
    return el('div.comments.comments_show');
  }
}

function createCommentsFeedElement(comments: HTMLElement) {
  if (isDesktop) {
    return (
      el('div',
        el('div.page-comments', { dataRole: "saved" },
          comments
        ),
        el('button.button_width_100.comments__more-button.loading', { id: 'loadingGizmo' }, 'Показать ещё'),
        el('div.player', { dataAnimationName: 'comments-spinner', dataType: 'animation' },
          el('div.player__overlay'),
          el('div.player__player.player__player_hide'))
      )
    );
  } else {
    return (
      el('div',
        el('div.page-story',
          el('div.page-story__comments.section-group',
            el('div.comments-wrapper',
              el('div.comments__container.comments__container_main',
                comments
              ),
            )
          )
        ),
        el('span.comments__next.more_action.boldlabel.control', { id: 'loadingGizmo', onclick: "loadNextCommentsBatch" }, 'Показать ещё')
      )
    )
  }
}

async function showComments() {
  await loadNextCommentsBatch();
}

function startLoading() {
  // if (loadingGizmo) loadingGizmo.classList.add('loading');
}

function finishLoading() {
  // if (loadingGizmo) loadingGizmo.classList.remove('loading');
}

async function loadNextCommentsBatch() {
  startLoading();
  commentsElement.classList.add('peoplemeter-active');
  window.location.hash = '#comments';
  storiesFeed.style.display = 'none';
  if (pagination) pagination.style.display = 'none';
  if (ratingsPane) ratingsPane.style.display = 'none';
  if (searchPane) searchPane.style.display = 'none';
  commentsFeed.style.display = 'block';
  const r = await fetch(`https://peoplemeter.ru/api/comments/${userName}?skipTill=${skipTill}`);
  const reply = (await r.json()) as Comment[];
  if (isDesktop) {
    renderDesktopComments(reply);
  } else {
    renderMobileComments(reply);
  }
  skipTill = Math.min.apply(Math, reply.map(c => c.commentId));
  finishLoading();
}

commentsElement.addEventListener('click', () => { showComments(); });
postsElement.addEventListener('click', () => { showPosts(); });

if (window.location.hash === '#comments') {
  showComments();
}
