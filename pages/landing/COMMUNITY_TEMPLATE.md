# Community Member Template

Use this template to add new community members to the community page.

## HTML Structure Template

```html
<!-- [Member Name] Profile -->
<article class="member-profile" id="[member-id]">
    <div class="member-header">
        <div class="member-info">
            <div class="member-photo">Photo Coming Soon</div>
            <!-- Replace with: <img src="../../images/community/[member-photo].jpg" alt="[Member Name]" class="member-photo" loading="lazy"> -->
            <div class="member-details">
                <h2>[Member Name]</h2>
                <div class="member-titles">
                    <span class="title-badge">[Title 1]</span>
                    <span class="title-badge">[Title 2]</span>
                    <span class="title-badge">[Title 3]</span>
                </div>
                <p class="member-summary">
                    [Brief summary paragraph about the member and their contributions]
                </p>
            </div>
        </div>
    </div>

    <div class="member-content">
        <div class="content-grid">
            <div class="biography-section">
                <h3>Biography</h3>
                <div class="biography-text">
                    <p>[Biography paragraph 1]</p>
                    <p>[Biography paragraph 2]</p>
                    <p>[Biography paragraph 3]</p>
                </div>

                <h3>Achievements & Contributions</h3>
                <div class="achievement-item">
                    <h4>[Achievement Title 1]</h4>
                    <p>[Achievement description]</p>
                </div>
                <div class="achievement-item">
                    <h4>[Achievement Title 2]</h4>
                    <p>[Achievement description]</p>
                </div>
                <!-- Add more achievement-item blocks as needed -->
            </div>

            <div class="resources-section">
                <h3>Resources & Links</h3>
                
                <!-- Optional: Video embed -->
                <div class="video-embed">
                    <iframe 
                        src="[VIDEO_URL]" 
                        title="[Video Title]"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <p>[Video description]</p>

                <h3>Related Resources</h3>
                <a href="[URL]" class="resource-link" target="_blank" rel="noopener">
                    <h4>[Resource Title]</h4>
                    <p>[Resource description]</p>
                </a>
                <!-- Add more resource-link blocks as needed -->
            </div>
        </div>

        <!-- Optional: Photo Gallery -->
        <div class="photo-gallery">
            <h3>Photo Gallery</h3>
            <div class="gallery-grid">
                <div class="gallery-item">
                    <div class="gallery-placeholder">[Photo Description]</div>
                    <div class="gallery-caption">[Caption]</div>
                </div>
                <!-- Add more gallery items as needed -->
            </div>
        </div>
    </div>
</article>

<!-- Section Divider -->
<div class="section-divider"></div>
```

## Instructions

1. **Copy the template** above and replace all bracketed placeholders with actual content
2. **Member ID**: Use lowercase, hyphen-separated format (e.g., "john-smith")
3. **Photos**: 
   - Bio photo: 200x250px recommended
   - Gallery photos: 400x300px minimum (will be resized)
   - Place in `/images/community/` directory
4. **Title badges**: Keep concise (2-4 words max)
5. **Insert location**: Add before the "More Community Leaders Coming Soon" section

## Example Member Types

- Tournament Directors
- State Chess Association Presidents/Board Members
- Club Presidents
- USCF Delegates
- Chess Coaches/Instructors
- Event Organizers
- Chess Journalists/Content Creators
- Scholastic Chess Coordinators

## Content Guidelines

- **Biography**: 3-4 paragraphs, 150-200 words each
- **Achievements**: 3-6 items, focus on impact and leadership
- **Resources**: Include relevant links, videos, articles
- **Photos**: Ensure proper permissions and attribution
- **Tone**: Professional yet approachable, highlighting contributions to chess community
