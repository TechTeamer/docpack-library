# Use the official TeX Live image from Docker Hub
FROM texlive/texlive

# Set the working directory in the container
WORKDIR /data

# Install additional necessary packages if needed
RUN tlmgr update --self && \
    tlmgr install latexmk && \
    tlmgr install markdown

# Expose the working directory
VOLUME ["/data"]

# Set the entrypoint to latexmk, so it runs by default when the container starts
ENTRYPOINT ["latexmk", "-pdf"]

#CMD ["bash"]
